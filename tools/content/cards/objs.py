# -*- coding: utf-8 -*-
"""رسومات أصلية للبطاقات الخمس الناقصة: ذرة، ملكة، شاحنة صغيرة، إكسيلوفون، يويو (نفس أسلوب images.py)."""
import math
from PIL import ImageDraw
from images import canvas, save, shade, S, W, PUR

def sh(d, box):  # ظل أرضي
    d.ellipse(box, fill=(0,0,0,40))
def E(d, b, c, o=None, w=0): d.ellipse([v*S for v in b], fill=c, outline=o, width=w*S)
def R(d, b, c, r=0, o=None, w=0): d.rounded_rectangle([v*S for v in b], radius=r*S, fill=c, outline=o, width=w*S)
def P(d, pts, c, o=None): d.polygon([(x*S,y*S) for x,y in pts], fill=c, outline=o)
def L(d, pts, c, w): d.line([(x*S,y*S) for x,y in pts], fill=c, width=w*S, joint="curve")
def eyes(d, x, y, gap, r=9):
    for dx in (-gap, gap):
        E(d,(x+dx-r,y-r,x+dx+r,y+r),"#3b2a50"); E(d,(x+dx-r*0.4,y-r*0.7,x+dx+r*0.2,y-r*0.1),"white")

def corn():
    im=canvas(); d=ImageDraw.Draw(im)
    sh(d,(120*S,440*S,400*S,490*S))
    # أوراق خلفية
    P(d,[(256,470),(110,250),(150,120),(256,330)],"#3d9a45"); P(d,[(256,470),(402,250),(362,120),(256,330)],"#3d9a45")
    # كوز الذرة
    E(d,(170,40,342,470),"#f9c522","#d99a0b",6)
    for r in range(8):
        for c in range(4):
            x=198+c*38+(r%2)*0; y=80+r*45
            E(d,(x-14,y-17,x+14,y+17),"#ffe066","#e0a410",3)
    # أوراق أمامية
    P(d,[(256,480),(150,300),(190,200),(256,380)],"#56b85c","#2d7a35"); P(d,[(256,480),(362,300),(322,200),(256,380)],"#56b85c","#2d7a35")
    eyes(d,256,200,30,10); L(d,[(238,232),(256,246),(274,232)],"#3b2a50",5)
    save(im,"obj/corn.webp")

def queen():
    im=canvas(); d=ImageDraw.Draw(im)
    sh(d,(110*S,470*S,402*S,505*S))
    # شعر خلف
    R(d,(120,170,392,470),"#7a4a2a",60)
    # فستان
    P(d,[(256,330),(120,500),(392,500)],"#9b59ff","#6a2fd0")
    E(d,(176,420,336,500),"#b685ff")
    # الرأس
    E(d,(150,130,362,370),"#ffd9b8","#e0aa80",5)
    # التاج
    P(d,[(170,170),(180,70),(220,120),(256,50),(292,120),(332,70),(342,170)],"#ffc928","#d99a0b")
    R(d,(168,160,344,190),"#ffb300",8,"#d99a0b",4)
    for x,c in ((220,"#e53935"),(256,"#29b6f6"),(292,"#e53935")): E(d,(x-9,168,x+9,186),c)
    # وجه
    eyes(d,256,255,48,13)
    E(d,(168,280,208,312),"#ff9db0"); E(d,(304,280,344,312),"#ff9db0")
    L(d,[(226,308),(256,334),(286,308)],"#c2410c",6)
    save(im,"obj/queen.webp")

def van():
    im=canvas(); d=ImageDraw.Draw(im)
    sh(d,(50*S,420*S,470*S,470*S))
    R(d,(40,170,470,400),"#29b6f6",50,"#0d7fb5",6)
    R(d,(60,120,330,250),"#29b6f6",40,"#0d7fb5",6)
    P(d,[(330,170),(330,250),(450,250),(400,170)],"#e1f5fe","#0d7fb5")
    R(d,(85,145,170,225),"#e1f5fe",14,"#0d7fb5",4); R(d,(185,145,310,225),"#e1f5fe",14,"#0d7fb5",4)
    R(d,(40,300,470,330),"#7c4dff"); R(d,(440,260,470,290),"#ffe066",8)
    for cx in (140,370):
        E(d,(cx-58,342,cx+58,458),"#37474f"); E(d,(cx-30,370,cx+30,430),"#cfd8dc"); E(d,(cx-10,390,cx+10,410),"#78909c")
    save(im,"obj/van.webp")

def xylo():
    im=canvas(); d=ImageDraw.Draw(im)
    sh(d,(60*S,450*S,460*S,495*S))
    L(d,[(110,150),(60,440)],"#8d5a2b",16); L(d,[(402,150),(452,440)],"#8d5a2b",16)
    L(d,[(120,380),(392,380)],"#8d5a2b",14)
    cols=["#e53935","#fb8c00","#fdd835","#43a047","#29b6f6","#5c6bc0","#8e24aa"]
    for i,c in enumerate(cols):
        w=52; x=70+i*52; top=130+i*14; bot=370-i*14
        R(d,(x,top,x+w-6,bot),c,14,shade(c,0.7),4)
        E(d,(x+w/2-3-7,top+22,x+w/2-3+7,top+36),shade(c,0.6))
        E(d,(x+w/2-3-7,bot-36,x+w/2-3+7,bot-22),shade(c,0.6))
    for sx,sy,ex,ey in ((380,60,300,140),(140,30,220,120)):
        L(d,[(sx,sy),(ex,ey)],"#c9a06b",10); E(d,(sx-22,sy-22,sx+22,sy+22),"#ff7043","#c2410c",4)
    save(im,"obj/xylophone.webp")

def yoyo():
    im=canvas(); d=ImageDraw.Draw(im)
    sh(d,(120*S,462*S,392*S,500*S))
    L(d,[(256,24),(256,170)],"#8d6e63",8)
    E(d,(226,4,286,44),None,"#8d6e63",8)
    E(d,(78,170,434,490),"#ff7043","#c2410c",6)
    E(d,(120,212,392,448),"#ff8a65")
    E(d,(150,240,362,420),"#ff7043","#c2410c",5)
    E(d,(196,282,316,382),"#7c4dff","#5326b5",5)
    E(d,(232,314,280,350),"#ffe066")
    E(d,(110,200,200,260),(255,255,255,120))
    save(im,"obj/yoyo.webp")

if __name__=="__main__":
    corn(); queen(); van(); xylo(); yoyo(); print("ok")

def face(d,x,y,g=26,r=9):
    eyes(d,x,y,g,r); L(d,[(x-16,y+30),(x,y+42),(x+16,y+30)],"#3b2a50",5)

def mango():
    im=canvas(); d=ImageDraw.Draw(im); sh(d,(110*S,450*S,410*S,495*S))
    L(d,[(300,70),(330,40)],"#6d4c41",12)
    P(d,[(300,80),(400,40),(380,120)],"#43a047","#2d7a35")
    E(d,(90,80,430,470),"#ffb300","#e08a00",6); E(d,(250,200,410,440),"#ff8f00"); E(d,(130,120,210,190),(255,255,255,110))
    face(d,230,290,34,11); E(d,(160,330,200,360),"#ff9db0")
    save(im,"obj/mango.webp")

def pineapple():
    im=canvas(); d=ImageDraw.Draw(im); sh(d,(130*S,462*S,390*S,500*S))
    for pts in ([(256,170),(140,40),(215,150)],[(256,170),(256,10),(290,150)],[(256,170),(372,40),(300,150)],[(256,170),(190,20),(236,150)],[(256,170),(322,20),(276,150)]):
        P(d,pts,"#43a047","#2d7a35")
    E(d,(150,140,362,490),"#fdc830","#d99a0b",6)
    for i in range(5):
        for j in range(4):
            x=190+j*44+(i%2)*22; y=185+i*58
            P(d,[(x,y-22),(x+22,y),(x,y+22),(x-22,y)],"#f0a30a","#c47d00")
    R(d,(206,250,306,330),"#fdc830",30); face(d,256,285,24,9)
    save(im,"obj/pineapple.webp")

def pear():
    im=canvas(); d=ImageDraw.Draw(im); sh(d,(110*S,455*S,400*S,498*S))
    L(d,[(256,120),(270,45)],"#6d4c41",12); P(d,[(272,70),(370,40),(340,110)],"#43a047","#2d7a35")
    E(d,(170,100,342,300),"#a5d63f","#7ca51f",6); E(d,(90,220,422,490),"#a5d63f","#7ca51f",6)
    E(d,(100,230,412,484),"#a5d63f"); E(d,(120,250,200,320),(255,255,255,100))
    face(d,256,360,34,11); E(d,(150,395,190,425),"#ff9db0"); E(d,(322,395,362,425),"#ff9db0")
    save(im,"obj/pear.webp")

def peach():
    im=canvas(); d=ImageDraw.Draw(im); sh(d,(110*S,455*S,400*S,498*S))
    L(d,[(256,90),(256,50)],"#6d4c41",12); P(d,[(262,70),(370,30),(350,110)],"#43a047","#2d7a35")
    E(d,(80,80,432,470),"#ffab91","#e6785a",6); E(d,(280,230,420,440),"#ff8a65")
    L(d,[(256,100),(240,200),(256,300),(240,440)],"#e6785a",5)
    E(d,(130,130,210,200),(255,255,255,110)); face(d,200,290,34,11); E(d,(130,330,172,360),"#ff7a8c")
    save(im,"obj/peach.webp")

def person(name, skin, hair, shirt, kind):
    im=canvas(); d=ImageDraw.Draw(im); sh(d,(110*S,462*S,402*S,500*S))
    big = kind in ("mom","dad","grandma","grandpa")
    top = 190 if big else 250
    # الجسم
    R(d,(150 if big else 180,top+130,362 if big else 332,500),shirt,60)
    R(d,(226,top+110,286,top+160),skin)
    # شعر خلفي
    if kind in("mom","sister","grandma"): R(d,(150,90,362,top+120),hair,70)
    hx,hy=256,(top+30 if big else top+10)
    rr=118 if big else 104
    E(d,(hx-rr,hy-rr,hx+rr,hy+rr),skin,shade(skin_hex(skin),0.8),5)
    # شعر أمامي
    if kind=="dad": E(d,(hx-rr,hy-rr,hx+rr,hy-10),hair)
    if kind=="brother": E(d,(hx-rr,hy-rr-6,hx+rr,hy-14),hair); 
    if kind in("mom","sister","grandma"): E(d,(hx-rr,hy-rr,hx+rr,hy-30),hair)
    if kind=="grandpa": E(d,(hx-rr+10,hy-rr+4,hx-rr+50,hy-30),"#e0e0e0"); E(d,(hx+rr-50,hy-rr+4,hx+rr-10,hy-30),"#e0e0e0")
    if kind=="grandma": E(d,(hx-45,hy-rr-30,hx+45,hy-rr+40),"#e0e0e0")
    if kind=="mom": E(d,(hx-40,hy-rr-34,hx+40,hy-rr+34),hair)
    if kind=="sister":
        E(d,(hx-rr-12,hy-rr-8,hx-rr+40,hy-rr+44),"#e53935"); E(d,(hx+rr-40,hy-rr-8,hx+rr+12,hy-rr+44),"#e53935")
    # وجه
    eyes(d,hx,hy+4,38 if big else 34,11); 
    E(d,(hx-rr+22,hy+30,hx-rr+60,hy+58),"#ff9db0"); E(d,(hx+rr-60,hy+30,hx+rr-22,hy+58),"#ff9db0")
    L(d,[(hx-18,hy+46),(hx,hy+62),(hx+18,hy+46)],"#3b2a50",6)
    if kind in("dad","grandpa"):
        c="#5d4037" if kind=="dad" else "#eeeeee"
        P(d,[(hx-80,hy+68),(hx,hy+84),(hx+80,hy+68),(hx+62,hy+124),(hx,hy+142),(hx-62,hy+124)],c)
    if kind in("grandma","grandpa"):
        for dx in(-38,38): E(d,(hx+dx-26,hy-20,hx+dx+26,hy+32),None,"#5d4037",5)
        L(d,[(hx-12,hy+4),(hx+12,hy+4)],"#5d4037",5)
    save(im,f"obj/{name}.webp")

def skin_hex(c): return c
def family():
    sk="#ffd9b8"
    person("mom",sk,"#5d3a1a","#e91e63","mom"); person("dad",sk,"#3e2723","#1e88e5","dad")
    person("grandma",sk,"#9e9e9e","#8e24aa","grandma"); person("grandpa",sk,"#9e9e9e","#43a047","grandpa")
    person("brother",sk,"#3e2723","#fb8c00","brother"); person("sister",sk,"#5d3a1a","#26a69a","sister")
if __name__=="__main__" and False: pass

def worker(name, shirt, hat, prop, hair="#3e2723"):
    im=canvas(); d=ImageDraw.Draw(im); sh(d,(110*S,462*S,402*S,500*S))
    sk="#ffd9b8"; hx,hy,rr=256,230,112
    R(d,(150,330,362,500),shirt,60); R(d,(226,320,286,370),sk)
    E(d,(hx-rr,hy-rr,hx+rr,hy+rr),sk,"#d9aa80",5)
    E(d,(hx-rr,hy-rr,hx+rr,hy-30),hair)
    eyes(d,hx,hy+8,38,11); E(d,(hx-rr+20,hy+34,hx-rr+58,hy+62),"#ff9db0"); E(d,(hx+rr-58,hy+34,hx+rr-20,hy+62),"#ff9db0")
    L(d,[(hx-18,hy+50),(hx,hy+66),(hx+18,hy+50)],"#3b2a50",6)
    if hat=="baker":
        R(d,(170,hy-rr-20,342,hy-rr+40),"white",10,"#cfcfcf",4); E(d,(150,hy-rr-110,262,hy-rr-10),"white","#cfcfcf",4); E(d,(250,hy-rr-110,362,hy-rr-10),"white","#cfcfcf",4); E(d,(200,hy-rr-135,312,hy-rr-30),"white","#cfcfcf",4)
        R(d,(330,380,470,430),"#d4a373",30,"#a9743b",5)  # خبز
    if hat=="cap":
        E(d,(hx-rr,hy-rr-30,hx+rr,hy-30),"#37474f"); R(d,(hx-rr+10,hy-70,hx+rr+30,hy-45),"#263238",12)
        E(d,(340,330,470,460),None,"#263238",14); L(d,[(405,330),(405,460)],"#263238",10); L(d,[(340,395),(470,395)],"#263238",10)
    if hat=="nurse":
        R(d,(170,hy-rr-30,342,hy-rr+40),"white",12,"#cfcfcf",4); R(d,(240,hy-rr-22,272,hy-rr+30),"#e53935"); R(d,(226,hy-rr-8,286,hy-rr+16),"#e53935")
        R(d,(330,370,400,470),"white",14,"#cfcfcf",4); R(d,(357,395,373,445),"#e53935"); R(d,(340,412,390,428),"#e53935")
    if hat=="beret":
        E(d,(160,hy-rr-30,380,hy-rr+60),"#e53935"); E(d,(240,hy-rr-48,272,hy-rr-14),"#e53935")
        L(d,[(400,300),(440,470)],"#8d6e63",14); P(d,[(388,270),(412,270),(404,320),(396,320)],"#29b6f6")
        E(d,(130,345,200,400),"#ffc928","#d99a0b",4)
    save(im,f"obj/{name}.webp")
def jobs():
    worker("baker","#ffffff","baker",None); worker("driver","#1e88e5","cap",None); worker("nurse","#26a69a","nurse",None); worker("painter","#8e24aa","beret",None)
